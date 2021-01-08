SELECT
    root.f_drop_config ('recipes',
        'tag',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.tag (
        tag_id SERIAL NOT NULL PRIMARY KEY,
        tag_group TEXT NOT NULL,
        name TEXT NOT NULL
);