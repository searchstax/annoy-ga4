import sqlite3
import json
from flask import Flask, request, g, render_template
from recommendations import recommender

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    db = get_db_connection()
    recos = db.execute('SELECT * FROM recommenders').fetchall()
    db.close()
    return render_template('recos.html', recos=recos)

@app.route("/get-recommenders")
def getrecommenders():
    db = get_db_connection()
    c = db.cursor()
    c.execute('SELECT id, name, ga_property_id, host_name, metric_name, url_filters FROM recommenders')

    rows = c.fetchall()
    db.close()

    recos = []
    for reco in rows:
        recos.append({
            'id': reco['id'],
            'name': reco['name'],
            'gaID': reco['ga_property_id'],
            'hostname': reco['host_name']
        })

    return {
        'status': 'success',
        'data': recos
    }, 200

@app.route("/load-recommender")
def loadrecommender():
    db = get_db_connection()
    recoID = int(request.args.get('recoID'))

    r = recommender(db)
    r.load_from_id(recoID)

    return {
        'status': 'success',
        'recoID': r.id,
        'name': r.name,
        'gaID': r.gaID,
        'hostname': r.hostname,
        'urlFilters': r.urlFilters,
        'metricName': r.metricName,
        'data': r.pageIDs,
        'titles': r.pageTitles
    }, 200

    db = get_db_connection()
    c = db.cursor()
    c.execute('SELECT id, name FROM recommenders')

    rows = c.fetchall()
    db.close()

    recos = []
    for reco in rows:
        recos.append({
            'id': reco['id'],
            'name': reco['name']
        })

    return {
        'status': 'success',
        'data': recos
    }, 200

@app.route("/new-recommendations", methods=['POST'])
def makerecommendations():
    data = request.get_json(silent=True)
    db = get_db_connection()
    r = recommender(db)
    r.create_new(data['name'], data['gaCredentials'], data['gaID'], data['hostname'], data['metric'], json.loads(data['urlFilters']))
    r.get_ga_data()
    r.build_page_rating()

    return {
        'status': 'success',
        'recoID': r.id,
        'data': r.pageIDs,
        'titles': r.pageTitles
    }, 200

@app.route("/get-pages")
def getpages():
    db = get_db_connection()
    recoID = int(request.args.get('recoID'))

    r = recommender(db)
    r.load_from_id(recoID)

    return {
        'status': 'success',
        'recoID': r.id,
        'data': r.pageIDs,
        'titles': r.pageTitles
    }, 200

@app.route("/get-recommendations")
def getrecommendations():
    db = get_db_connection()
    recoID = int(request.args.get('recoID'))
    pageID = int(request.args.get('pageID'))

    r = recommender(db)
    recos = r.load_recos(recoID, pageID)

    return {
        'status': 'success',
        'recoID': r.id,
        'data': recos
    }, 200

@app.route("/get-url-recommendations")
def geturlrecommendations():
    db = get_db_connection()
    recoID = int(request.args.get('recoID'))
    url = request.args.get('url')

    r = recommender(db)
    recos = r.load_url_recos(recoID, url)

    return {
        'status': 'success',
        'recoID': r.id,
        'data': recos[0],
        'titles': recos[1]
    }, 200

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()