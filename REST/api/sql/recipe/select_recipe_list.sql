SELECT
      r.recipe_id
    , r.name as recipe_name
    , t.name as tag_name
    , t.tag_group
    , COALESCE(rs.duration,0) as duration
FROM recipes.recipe r
LEFT JOIN recipes.recipe_tag rt ON rt.recipe_id = r.recipe_id
LEFT JOIN recipes.tag t ON rt.tag_id = t.tag_id
LEFT JOIN (
  SELECT 
      recipe_id
    , SUM(duration) AS duration
  FROM recipes.vv_recipe_step
  GROUP BY 
      recipe_id
  ) rs ON rs.recipe_id = r.recipe_id