SELECT
    root.f_drop_config ('recipes',
        'tv_recipe_step',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.tv_recipe_step (
        recipe_step_id SERIAL NOT NULL,
        recipe_id INT NOT NULL,
        step_no INT NOT NULL,
        description TEXT NOT NULL,
        duration INT NOT NULL DEFAULT 0,
        v_valid_from TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '1970-01-01 00:00:00',
        v_valid_to TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '9999-12-31 23:59:59',
        v_last_change TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '1970-01-01 00:00:00',
        v_deleted VARCHAR(1) NOT NULL DEFAULT 'N',
        v_changed_by TEXT NOT NULL DEFAULT 'n/a',
        CONSTRAINT fk_tvig_recipe_id
                FOREIGN KEY(recipe_id)
                        REFERENCES recipes.recipe(recipe_id),
        PRIMARY KEY (recipe_step_id,recipe_id,v_valid_to)
);