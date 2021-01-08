from flask_restx import Resource, Namespace, fields
from utils import file_processor, database_processor, sql_processor
from flask_restx import reqparse, inputs
from flask import request

api = Namespace('recipe_tag', description='Recipe-tag relationships')

getParser = reqparse.RequestParser()
getParser.add_argument('recipe_tag_id', required=True, type=int,
                    help="Id cannot be blank!")

postParser = reqparse.RequestParser()
postParser.add_argument('recipe_id', required=True, type=int,
                    help="Id cannot be blank!")
postParser.add_argument('tag_id', required=True, type=int,
                    help="Id cannot be blank!")

class HandleRecipeTag(Resource):    
    @api.doc(responses={
        400: 'Validation Error'
    })
    @api.doc(parser=postParser)
    def post(self): 
        args = postParser.parse_args()    
        QUERY_POST_RECIPE_TAG = file_processor.read_sql_file(
            "sql/recipe_tag/post_recipe_tag.sql")
        sql_creation = QUERY_POST_RECIPE_TAG.format(args['recipe_id'],args['tag_id'])
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
        return 201
    
    @api.doc(parser=getParser)
    def delete(self):
        args = getParser.parse_args()    
        QUERY_DELETE_RECIPE_TAG = file_processor.read_sql_file(
            "sql/recipe_tag/delete_recipe_tag.sql")
        sql_creation = QUERY_DELETE_RECIPE_TAG.format(args['recipe_tag_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201

   
