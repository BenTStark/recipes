SELECT 
      tag_id
    , tag_group
    , name
FROM recipes.tag
WHERE 1=1
AND tag_id = {0};