SELECT
    root.f_drop_config ('recipes',
        'tv_ingredient_composition',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.tv_ingredient_composition (
        ingredient_composition_id BIGSERIAL NOT NULL,
        ingredient_id INT NOT NULL,
        recipe_id INT NOT NULL,
        condition_id INT NOT NULL,
        quantity_type_id INT NOT NULL,
        quantity REAL NOT NULL DEFAULT 0,
        v_valid_from TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '1970-01-01 00:00:00',
        v_valid_to TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '9999-12-31 23:59:59',
        v_last_change TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '1970-01-01 00:00:00',
        v_deleted VARCHAR(1) NOT NULL DEFAULT 'N',
        v_changed_by TEXT NOT NULL DEFAULT 'n/a',
        CONSTRAINT fk_tvig_ingredient_id
                FOREIGN KEY(ingredient_id)
                        REFERENCES recipes.ingredient(ingredient_id),
        CONSTRAINT fk_tvig_recipe_id
                FOREIGN KEY(recipe_id)
                        REFERENCES recipes.recipe(recipe_id),
        CONSTRAINT fk_tvig_condition_id
                FOREIGN KEY(condition_id)
                        REFERENCES recipes.condition(condition_id),
        CONSTRAINT fk_tvig_quantity_type_id
                FOREIGN KEY(quantity_type_id)
                        REFERENCES recipes.quantity_type(quantity_type_id),
        PRIMARY KEY (ingredient_composition_id,ingredient_id,recipe_id,condition_id,quantity_type_id,v_valid_to)
);