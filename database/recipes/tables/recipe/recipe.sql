SELECT
    root.f_drop_config ('recipes',
        'recipe',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.recipe (
        recipe_id SERIAL NOT NULL PRIMARY KEY,
        name TEXT NOT NULL
);