from flask_restx import Resource, Namespace, fields
from utils import file_processor, database_processor, sql_processor
from flask_restx import reqparse, inputs
from flask import request
import pandas as pd
import json

api = Namespace('quantity_type', description='Handling quantity_types')

model_quantity_type = api.model('quantity_type', {
    'nextId': fields.Integer(required=True, description='The next identifier;'),
    'payload': fields.List(fields.Nested(api.model('quantity_type_payload', {
        'quantity_type_id': fields.Integer(required=True, description='quantity_type idenifier'),
        'quantity_type': fields.String(required=True, description='quantity_type name'),
        'abbreviation': fields.String(required=True, description='abbreviation')   
    })))
})

post_model_quantity_type = api.model('quantity_type_post', {
    'nextId': fields.Integer(required=True, description='The next identifier;')
})

@api.response(404, 'Entry not found')
class HandleQuantityTypeList(Resource):
    @api.marshal_with(model_quantity_type)
    def get(self):          
        QUERY_SELECT_QUANTITY_TYPE_LIST = file_processor.read_sql_file(
            "sql/quantity_type/select_quantity_type_list.sql")
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(QUERY_SELECT_QUANTITY_TYPE_LIST).to_dict(orient="records")
        
        # START - Get nextId
        QUERY_NEXTID_QUANTITY_TYPE = file_processor.read_sql_file(
            "sql/quantity_type/nextid_quantity_type.sql")
        sql_creation = QUERY_NEXTID_QUANTITY_TYPE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)


postParser = reqparse.RequestParser()
postParser.add_argument('quantity_type', required=True, type=str)
postParser.add_argument('abbreviation', required=True, type=str)

updateParser = reqparse.RequestParser()
updateParser.add_argument('quantity_type_id', required=True, type=int,
                    help="Id cannot be blank!")
updateParser.add_argument('quantity_type', required=True, type=str)
updateParser.add_argument('abbreviation', required=True, type=str)

deleteParser = reqparse.RequestParser()
deleteParser.add_argument('quantity_type_id', required=True, type=int,
                    help="Id cannot be blank!")

getParser = reqparse.RequestParser()
getParser.add_argument('quantity_type_id', required=True, type=int,
                    help="Id cannot be blank!")

class HandleQuantityType(Resource):    
    @api.doc(parser=getParser)
    def get(self):   
        args = getParser.parse_args()           
        QUERY_SELECT_QUANTITY_TYPE = file_processor.read_sql_file(
            "sql/quantity_type/select_quantity_type.sql")
        sql_creation = QUERY_SELECT_QUANTITY_TYPE.format(args['quantity_type_id'])
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(sql_creation).to_dict(orient="records")
        # START - Get nextId
        QUERY_NEXTID_QUANTITY_TYPE = file_processor.read_sql_file(
            "sql/quantity_type/nextid_quantity_type.sql")
        sql_creation = QUERY_NEXTID_QUANTITY_TYPE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)
    
    @api.doc(parser=postParser)
    @api.doc(responses={
        400: 'Validation Error'
    })
    @api.marshal_with(post_model_quantity_type, code=201, description='new quantity_type created')
    def post(self):
        args = postParser.parse_args()    
        QUERY_POST_QUANTITY_TYPE = file_processor.read_sql_file(
            "sql/quantity_type/post_quantity_type.sql")
        sql_creation = QUERY_POST_QUANTITY_TYPE.format("\'{}\'".format(args['quantity_type']),"\'{}\'".format(args['abbreviation']))
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
         # START Get nextId
        QUERY_NEXTID_QUANTITY_TYPE= file_processor.read_sql_file(
            "sql/quantity_type/nextid_quantity_type.sql")
        sql_creation = QUERY_NEXTID_QUANTITY_TYPE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        return ({'nextId': nextId[0][0]},201)

    @api.doc(parser=updateParser)
    def put(self):
        args = updateParser.parse_args()    
        QUERY_PUT_QUANTITY_TYPE = file_processor.read_sql_file(
            "sql/quantity_type/put_quantity_type.sql")
        sql_creation = QUERY_PUT_QUANTITY_TYPE.format("\'{}\'".format(args['quantity_type']),"\'{}\'".format(args['abbreviation']),args['quantity_type_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201
    
    @api.doc(parser=deleteParser)
    def delete(self):
        args = deleteParser.parse_args()    
        QUERY_DELETE_QUANTITY_TYPE = file_processor.read_sql_file(
            "sql/quantity_type/delete_quantity_type.sql")
        sql_creation = QUERY_DELETE_QUANTITY_TYPE.format(args['quantity_type_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201

   
