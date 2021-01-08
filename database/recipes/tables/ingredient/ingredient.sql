SELECT
    root.f_drop_config ('recipes',
        'ingredient',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.ingredient (
        ingredient_id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
);