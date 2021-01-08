SELECT 
    last_value + 1 AS ingredient_id
FROM recipes.ingredient_ingredient_id_seq;