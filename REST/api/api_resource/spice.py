from flask_restx import Resource, Namespace, fields
from utils import file_processor, database_processor, sql_processor
from flask_restx import reqparse, inputs
from flask import request
import pandas as pd
import json

api = Namespace('spice', description='Handling  spices')

model_spice = api.model('spice', {
    'nextId': fields.Integer(required=True, description='The next identifier;'),
    'payload': fields.List(fields.Nested(api.model('spice_payload', {
        'spice_id': fields.Integer(required=True, description='spice idenifier'),
        'name': fields.String(required=True, description='spice name')
    })))
})

post_model_spice = api.model('spice_post', {
    'nextId': fields.Integer(required=True, description='The next identifier;')
})

@api.response(404, 'Entry not found')
class HandleSpiceList(Resource):
    @api.marshal_with(model_spice)
    def get(self):          
        QUERY_SELECT_SPICE_LIST = file_processor.read_sql_file(
            "sql/spice/select_spice_list.sql")
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(QUERY_SELECT_SPICE_LIST).to_dict(orient="records")
        
        # START - Get nextId
        QUERY_NEXTID_SPICE = file_processor.read_sql_file(
            "sql/spice/nextid_spice.sql")
        sql_creation = QUERY_NEXTID_SPICE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)


postParser = reqparse.RequestParser()
postParser.add_argument('name', required=True, type=str)

updateParser = reqparse.RequestParser()
updateParser.add_argument('spice_id', required=True, type=int,
                    help="Id cannot be blank!")
updateParser.add_argument('name', required=False, type=str)

deleteParser = reqparse.RequestParser()
deleteParser.add_argument('spice_id', required=True, type=int,
                    help="Id cannot be blank!")

getParser = reqparse.RequestParser()
getParser.add_argument('spice_id', required=True, type=int,
                    help="Id cannot be blank!")

class HandleSpice(Resource):    
    @api.doc(parser=getParser)
    def get(self):   
        args = getParser.parse_args()           
        QUERY_SELECT_SPICE = file_processor.read_sql_file(
            "sql/spice/select_spice.sql")
        sql_creation = QUERY_SELECT_SPICE.format(args['spice_id'])
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(sql_creation).to_dict(orient="records")
        # START - Get nextId
        QUERY_NEXTID_SPICE = file_processor.read_sql_file(
            "sql/spice/nextid_spice.sql")
        sql_creation = QUERY_NEXTID_SPICE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)
    
    @api.doc(parser=postParser)
    @api.doc(responses={
        400: 'Validation Error'
    })
    @api.marshal_with(post_model_spice, code=201, description='new spice created')
    def post(self):
        args = postParser.parse_args()    
        QUERY_POST_SPICE = file_processor.read_sql_file(
            "sql/spice/post_spice.sql")
        sql_creation = QUERY_POST_SPICE.format("\'{}\'".format(args['name']))
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
         # START Get nextId
        QUERY_NEXTID_SPICE= file_processor.read_sql_file(
            "sql/spice/nextid_spice.sql")
        sql_creation = QUERY_NEXTID_SPICE
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        return ({'nextId': nextId[0][0]},201)

    @api.doc(parser=updateParser)
    def put(self):
        args = updateParser.parse_args()    
        QUERY_PUT_SPICE = file_processor.read_sql_file(
            "sql/spice/put_spice.sql")
        sql_creation = QUERY_PUT_SPICE.format("\'{}\'".format(args['name']),args['spice_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201
    
    @api.doc(parser=deleteParser)
    def delete(self):
        args = deleteParser.parse_args()    
        QUERY_DELETE_SPICE = file_processor.read_sql_file(
            "sql/spice/delete_spice.sql")
        sql_creation = QUERY_DELETE_SPICE.format(args['spice_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201

   
