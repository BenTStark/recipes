SELECT 
      recipe_step_id
    , recipe_id
    , step_no
    , description
    , duration
FROM recipes.vv_recipe_step
WHERE 1=1
AND recipe_id = {0};