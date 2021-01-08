from flask_restx import Resource, Namespace, fields
from utils import file_processor, database_processor, sql_processor
from flask_restx import reqparse, inputs
from flask import request
import pandas as pd
import json

api = Namespace('recipe', description='Handling all recipes including tags, spices, ingredients and production steps')

model_recipe = api.model('recipe', {
    'nextId': fields.Integer(required=True, description='The next identifier;'),
    'payload': fields.List(fields.Nested(api.model('recipe_payload', {
        'recipe_id': fields.Integer(required=True, description='Recipe idenifier'),
        'name': fields.String(required=True, description='Recipe name'),
        'tags': fields.List(fields.Nested(api.model('tag list', {
            'tag_name': fields.String(required=True, description='tag name'),
            'tag_group': fields.String(required=True, description='tag group'),
        }))),
        'duration': fields.Float
    })))
})

post_model_recipe = api.model('recipe_post', {
    'nextId': fields.Integer(required=True, description='The next identifier;')
})


@api.response(404, 'Entry not found')
class HandleRecipeList(Resource):
    @api.marshal_with(model_recipe)
    def get(self):          
        QUERY_SELECT_RECIPE_LIST = file_processor.read_sql_file(
            "sql/recipe/select_recipe_list.sql")
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(QUERY_SELECT_RECIPE_LIST)
        recipes = recipeList.groupby(['recipe_id','recipe_name'],as_index=False).max('duration')[['recipe_id','recipe_name','duration']].rename(columns={'recipe_name': 'name'}).to_dict(orient="records") 
        tagList = recipeList.groupby(['recipe_id','tag_name','tag_group'],as_index=False).last()[['recipe_id','tag_name','tag_group']].to_dict(orient="records") # .groupby(['recipe_id']).tag_name_group.apply(list).reset_index().to_dict(orient="records")

        items = []
        for recipe_r in recipes:
            recipe_r['tags'] = []
            for recipe_tl in tagList:
                if recipe_r['recipe_id'] == recipe_tl['recipe_id']:
                    tag = {key:recipe_tl[key] for key in ['tag_name', 'tag_group']}
                    recipe_r['tags'].append(tag)
                    items.append(recipe_r)
                    

        QUERY_NEXTID_RECIPE = file_processor.read_sql_file(
            "sql/recipe/nextid_recipe.sql")
        sql_creation = QUERY_NEXTID_RECIPE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if items:
            return {'payload': items, 'nextId': nextId[0][0]}
        api.abort(404)


postParser = reqparse.RequestParser()
postParser.add_argument('name', required=True, type=str)

updateParser = reqparse.RequestParser()
updateParser.add_argument('recipe_id', required=True, type=int,
                    help="Id cannot be blank!")
updateParser.add_argument('name', required=False, type=str)

deleteParser = reqparse.RequestParser()
deleteParser.add_argument('recipe_id', required=True, type=int,
                    help="Id cannot be blank!")

class HandleRecipe(Resource):    
    @api.doc(parser=postParser)
    @api.doc(responses={
        400: 'Validation Error'
    })
    @api.marshal_with(post_model_recipe, code=201, description='new recipe created')
    def post(self):
        args = postParser.parse_args()    
        QUERY_POST_RECIPE = file_processor.read_sql_file(
            "sql/recipe/post_recipe.sql")
        sql_creation = QUERY_POST_RECIPE.format("\'{}\'".format(args['name']))
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
         # START Get nextId
        QUERY_NEXTID_RECIPE= file_processor.read_sql_file(
            "sql/recipe/nextid_recipe.sql")
        sql_creation = QUERY_NEXTID_RECIPE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        return ({'nextId': nextId[0][0]},201)

    @api.doc(parser=updateParser)
    def put(self):
        args = updateParser.parse_args()    
        QUERY_PUT_RECIPE = file_processor.read_sql_file(
            "sql/recipe/put_recipe.sql")
        sql_creation = QUERY_PUT_RECIPE.format("\'{}\'".format(args['name']),args['recipe_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201
    
    @api.doc(parser=deleteParser)
    def delete(self):
        args = deleteParser.parse_args()    
        QUERY_DELETE_RECIPE = file_processor.read_sql_file(
            "sql/recipe/delete_recipe.sql")
        sql_creation = QUERY_DELETE_RECIPE.format(args['recipe_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201

   
