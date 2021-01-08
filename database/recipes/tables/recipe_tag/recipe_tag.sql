SELECT
    root.f_drop_config ('recipes',
        'recipe_tag',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.recipe_tag (
        recipe_tag_id SERIAL NOT NULL,
        recipe_id INT NOT NULL,
        tag_id INT NOT NULL,
        CONSTRAINT fk_rt_recipe_id
                FOREIGN KEY(recipe_id)
                        REFERENCES recipes.recipe(recipe_id),
        CONSTRAINT fk_rt_tag_id
                FOREIGN KEY(tag_id)
                        REFERENCES recipes.tag(tag_id)
);