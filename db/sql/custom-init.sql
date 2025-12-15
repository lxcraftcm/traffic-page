CREATE TABLE
    IF NOT EXISTS t_user (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT UNIQUE NOT NULL,
                            email TEXT,
                            credentials TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            deleted_at DATETIME
);

CREATE TABLE
    IF NOT EXISTS t_rsa_info (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            public_key TEXT UNIQUE NOT NULL,
                            private_key TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            deleted_at DATETIME
);

CREATE TABLE
    IF NOT EXISTS t_user_page (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER NOT NULL,
                            page_json TEXT NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            deleted_at DATETIME
);

CREATE TABLE
    IF NOT EXISTS t_system_setting (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            system_name STRING NOT NULL,
                            description STRING NOT NULL,
                            copyright STRING NOT NULL,
                            default_language STRING NOT NULL,
                            default_theme STRING NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            deleted_at DATETIME
);