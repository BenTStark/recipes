SELECT
    root.f_drop_config ('recipes',
        'tv_spice_composition',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.tv_spice_composition (
        spice_composition_id BIGSERIAL NOT NULL,
        spice_id INT NOT NULL,
        recipe_id INT NOT NULL,
        quantity_type_id INT NOT NULL,
        quantity REAL NOT NULL DEFAULT 0,
        v_valid_from TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '1970-01-01 00:00:00',
        v_valid_to TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '9999-12-31 23:59:59',
        v_last_change TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '1970-01-01 00:00:00',
        v_deleted VARCHAR(1) NOT NULL DEFAULT 'N',
        v_changed_by TEXT NOT NULL DEFAULT 'n/a',
        CONSTRAINT fk_tvsc_spice_id
                FOREIGN KEY(spice_id)
                        REFERENCES recipes.spice(spice_id),
        CONSTRAINT fk_tvsc_recipe_id
                FOREIGN KEY(recipe_id)
                        REFERENCES recipes.recipe(recipe_id),
        CONSTRAINT fk_tvsc_quantity_type_id
                FOREIGN KEY(quantity_type_id)
                        REFERENCES recipes.quantity_type(quantity_type_id),
        PRIMARY KEY (spice_composition_id,spice_id,recipe_id,quantity_type_id,v_valid_to)
);