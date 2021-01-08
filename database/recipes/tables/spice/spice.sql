SELECT
    root.f_drop_config ('recipes',
        'spice',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.spice (
        spice_id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL
);