SELECT
    root.f_drop_config ('recipes',
        'quantity_type',
        NULL);

CREATE TABLE IF NOT EXISTS recipes.quantity_type (
        quantity_type_id SERIAL NOT NULL PRIMARY KEY,
        quantity_type TEXT NOT NULL,
        abbreviation TEXT
);