SELECT
    root.f_drop_config ('recipes',
        'condition',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.condition (
        condition_id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL
);