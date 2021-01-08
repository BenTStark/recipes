from flask_restx import Resource, Namespace, fields
from utils import file_processor, database_processor, sql_processor
from flask_restx import reqparse, inputs
from flask import request
import pandas as pd

api = Namespace('ingredient', description='Handling ingredients')

model_ingredient = api.model('ingredient', {
    'pk_autofill': fields.Nested(api.model('ingredient_pk_autofill', {
        'ingredient_id': fields.Integer(required=True, description='The next identifier;')
    })),
    'payload': fields.List(fields.Nested(api.model('ingredient_payload', {
        'ingredient_id': fields.Integer(required=True, description='ingredient idenifier'),
        'name': fields.String(required=True, description='ingredient name'),
        'description': fields.String(required=False, description='description')
    })))
})

post_model_ingredient = api.model('ingredient_post', {
    'pk_autofill': fields.Nested(api.model('ingredient_pk_autofill', {
        'ingredient_id': fields.Integer(required=True, description='The next identifier;')
    }))
})

@api.response(404, 'Entry not found')
class HandleIngredientList(Resource):
    @api.marshal_with(model_ingredient)
    def get(self):          
        QUERY_SELECT_INGREDIENT_LIST = file_processor.read_sql_file(
            "sql/ingredient/select_ingredient_list.sql")
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(QUERY_SELECT_INGREDIENT_LIST).to_dict(orient="records")
        print(recipeList)
        # START - Get nextId
        QUERY_NEXTID_INGREDIENT = file_processor.read_sql_file(
            "sql/ingredient/nextid_ingredient.sql")
        sql_creation = QUERY_NEXTID_INGREDIENT
        pk_autofill = database_processor.fetch_data_in_database_pd_dataframe(sql_creation).to_dict(orient="records")[0]
        print(pk_autofill)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'pk_autofill': pk_autofill}
        api.abort(404)


postParser = reqparse.RequestParser()
postParser.add_argument('name', required=True, type=str)
postParser.add_argument('description', required=False, type=str)

updateParser = reqparse.RequestParser()
updateParser.add_argument('ingredient_id', required=True, type=int,
                    help="Id cannot be blank!")
updateParser.add_argument('name', required=True, type=str)
updateParser.add_argument('description', required=False, type=str)

deleteParser = reqparse.RequestParser()
deleteParser.add_argument('ingredient_id', required=True, type=int,
                    help="Id cannot be blank!")

getParser = reqparse.RequestParser()
getParser.add_argument('ingredient_id', required=True, type=int,
                    help="Id cannot be blank!")

class HandleIngredient(Resource):    
    @api.doc(parser=getParser)
    def get(self):   
        args = getParser.parse_args()           
        QUERY_SELECT_INGREDIENT = file_processor.read_sql_file(
            "sql/ingredient/select_ingredient.sql")
        sql_creation = QUERY_SELECT_INGREDIENT.format(args['ingredient_id'])
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(sql_creation).to_dict(orient="records")
        # START - Get nextId
        QUERY_NEXTID_INGREDIENT = file_processor.read_sql_file(
            "sql/ingredient/nextid_ingredient.sql")
        sql_creation = QUERY_NEXTID_INGREDIENT
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'pk_autofill': nextId[0][0]}
        api.abort(404)
    
    @api.doc(parser=postParser)
    @api.doc(responses={
        400: 'Validation Error'
    })
    @api.marshal_with(post_model_ingredient, code=201, description='new ingredient created')
    def post(self):
        args = postParser.parse_args()    
        QUERY_POST_INGREDIENT = file_processor.read_sql_file(
            "sql/ingredient/post_ingredient.sql")
        sql_creation = QUERY_POST_INGREDIENT.format("\'{}\'".format(args['name']),"\'{}\'".format(args['description']))
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
         # START Get nextId
        QUERY_NEXTID_INGREDIENT= file_processor.read_sql_file(
            "sql/ingredient/nextid_ingredient.sql")
        sql_creation = QUERY_NEXTID_INGREDIENT
        pk_autofill = database_processor.fetch_data_in_database_pd_dataframe(sql_creation)
        # END - Get nextId
        return ({'pk_autofill': pk_autofill},201)

    @api.doc(parser=updateParser)
    def put(self):
        args = updateParser.parse_args()    
        QUERY_PUT_INGREDIENT = file_processor.read_sql_file(
            "sql/ingredient/put_ingredient.sql")
        sql_creation = QUERY_PUT_INGREDIENT.format("\'{}\'".format(args['name']),"\'{}\'".format(args['description']),args['ingredient_id'])
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
        return 201
    
    @api.doc(parser=deleteParser)
    def delete(self):
        args = deleteParser.parse_args()    
        QUERY_DELETE_INGREDIENT = file_processor.read_sql_file(
            "sql/ingredient/delete_ingredient.sql")
        sql_creation = QUERY_DELETE_INGREDIENT.format(args['ingredient_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201

   
