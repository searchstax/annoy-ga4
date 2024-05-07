DROP TABLE IF EXISTS recommenders;

CREATE TABLE recommenders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    ga_credentials TEXT NOT NULL,
    ga_property_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    metric_name TEXT,
    url_filters TEXT,
    index_size INTEGER,
    page_map TEXT,
    titles TEXT
);