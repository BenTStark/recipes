SELECT 
      ingredient_id
    , name
    , description
FROM recipes.ingredient
WHERE 1=1
AND ingredient_id = {0};