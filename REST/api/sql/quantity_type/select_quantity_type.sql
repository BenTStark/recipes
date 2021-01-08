SELECT 
      quantity_type_id
    , quantity_type
    , abbreviation
FROM recipes.quantity_type
WHERE 1=1
AND quantity_type_id = {0};