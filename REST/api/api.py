from flask import Flask
from flask import request, jsonify
from flask_cors import CORS
from flask_restx import Resource, Api
import json
import yaml
import os
import psycopg2
from utils import file_processor, database_processor
import urllib.request
from api_resource import recipe, recipe_tag, condition, ingredient, quantity_type, spice, tag


app = Flask(__name__)
CORS(app)
basic_api = Api(app,
    title='REST API Recipes',
    version='1.0',
    description='REST API for recipies project')
#print(basic_api.namespace)

recipe_api = recipe.api
basic_api.add_namespace(recipe_api,path='/recipe')
recipe_api.add_resource(recipe.HandleRecipe, '')
recipe_api.add_resource(recipe.HandleRecipeList, '/list')

recipe_tag_api = recipe_tag.api
basic_api.add_namespace(recipe_tag_api,path='/recipe_tag')
recipe_tag_api.add_resource(recipe_tag.HandleRecipeTag, '')

condition_api = condition.api
basic_api.add_namespace(condition_api,path='/condition')
condition_api.add_resource(condition.HandleCondition, '')
condition_api.add_resource(condition.HandleConditionList, '/list')

ingredient_api = ingredient.api
basic_api.add_namespace(ingredient_api,path='/ingredient')
ingredient_api.add_resource(ingredient.HandleIngredient, '')
ingredient_api.add_resource(ingredient.HandleIngredientList, '/list')

quantity_type_api = quantity_type.api
basic_api.add_namespace(quantity_type_api,path='/quantity_type')
quantity_type_api.add_resource(quantity_type.HandleQuantityType, '')
quantity_type_api.add_resource(quantity_type.HandleQuantityTypeList, '/list')

spice_api = spice.api
basic_api.add_namespace(spice_api,path='/spice')
spice_api.add_resource(spice.HandleSpice, '')
spice_api.add_resource(spice.HandleSpiceList, '/list')

tag_api = tag.api
basic_api.add_namespace(tag_api,path='/tag')
tag_api.add_resource(tag.HandleTag, '')
tag_api.add_resource(tag.HandleTagList, '/list')

# timeseries_table_api = timeseries_table.api
# basic_api.add_namespace(timeseries_table_api,path='/timeseries')
# timeseries_table_api.add_resource(timeseries_table.GetTimeseriesTableListDate ,'')
# timeseries_table_api.add_resource(timeseries_table.GetTimeseriesTableItem, '/item')

# tv_versionised_table_api = tv_versionised_table.api
# basic_api.add_namespace(tv_versionised_table_api,path='/versionised')
# tv_versionised_table_api.add_resource(tv_versionised_table.GetVersionisedTableList,'')

# tv_image_api = tv_image.api
# basic_api.add_namespace(tv_image_api,path='/image')
# tv_image_api.add_resource(tv_image.GetImageTableList, '')
# tv_image_api.add_resource(tv_image.UploadImage, '/upload', endpoint='with-parser')

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
