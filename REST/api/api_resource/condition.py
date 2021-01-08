from flask_restx import Resource, Namespace, fields
from utils import file_processor, database_processor, sql_processor
from flask_restx import reqparse, inputs
from flask import request
import pandas as pd
import json

api = Namespace('condition', description='Handling ingredient conditions')

model_condition = api.model('condition', {
    'nextId': fields.Integer(required=True, description='The next identifier;'),
    'payload': fields.List(fields.Nested(api.model('condition_payload', {
        'condition_id': fields.Integer(required=True, description='condition idenifier'),
        'name': fields.String(required=True, description='condition name')
    })))
})

post_model_condition = api.model('condition_post', {
    'nextId': fields.Integer(required=True, description='The next identifier;')
})

@api.response(404, 'Entry not found')
class HandleConditionList(Resource):
    @api.marshal_with(model_condition)
    def get(self):          
        QUERY_SELECT_CONDITION_LIST = file_processor.read_sql_file(
            "sql/condition/select_condition_list.sql")
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(QUERY_SELECT_CONDITION_LIST).to_dict(orient="records")
        
        # START - Get nextId
        QUERY_NEXTID_CONDITION = file_processor.read_sql_file(
            "sql/condition/nextid_condition.sql")
        sql_creation = QUERY_NEXTID_CONDITION
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)


postParser = reqparse.RequestParser()
postParser.add_argument('name', required=True, type=str)

updateParser = reqparse.RequestParser()
updateParser.add_argument('condition_id', required=True, type=int,
                    help="Id cannot be blank!")
updateParser.add_argument('name', required=False, type=str)

deleteParser = reqparse.RequestParser()
deleteParser.add_argument('condition_id', required=True, type=int,
                    help="Id cannot be blank!")

getParser = reqparse.RequestParser()
getParser.add_argument('condition_id', required=True, type=int,
                    help="Id cannot be blank!")

class HandleCondition(Resource):    
    @api.doc(parser=getParser)
    def get(self):   
        args = getParser.parse_args()           
        QUERY_SELECT_CONDITION = file_processor.read_sql_file(
            "sql/condition/select_condition.sql")
        sql_creation = QUERY_SELECT_CONDITION.format(args['condition_id'])
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(sql_creation).to_dict(orient="records")
        # START - Get nextId
        QUERY_NEXTID_CONDITION = file_processor.read_sql_file(
            "sql/condition/nextid_condition.sql")
        sql_creation = QUERY_NEXTID_CONDITION
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)
    
    @api.doc(parser=postParser)
    @api.doc(responses={
        400: 'Validation Error'
    })
    @api.marshal_with(post_model_condition, code=201, description='new condition created')
    def post(self):
        args = postParser.parse_args()    
        QUERY_POST_CONDITION = file_processor.read_sql_file(
            "sql/condition/post_condition.sql")
        sql_creation = QUERY_POST_CONDITION.format("\'{}\'".format(args['name']))
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
         # START Get nextId
        QUERY_NEXTID_CONDITION= file_processor.read_sql_file(
            "sql/condition/nextid_condition.sql")
        sql_creation = QUERY_NEXTID_CONDITION
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        return ({'nextId': nextId[0][0]},201)

    @api.doc(parser=updateParser)
    def put(self):
        args = updateParser.parse_args()    
        QUERY_PUT_CONDITION = file_processor.read_sql_file(
            "sql/condition/put_condition.sql")
        sql_creation = QUERY_PUT_CONDITION.format("\'{}\'".format(args['name']),args['condition_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201
    
    @api.doc(parser=deleteParser)
    def delete(self):
        args = deleteParser.parse_args()    
        QUERY_DELETE_CONDITION = file_processor.read_sql_file(
            "sql/condition/delete_condition.sql")
        sql_creation = QUERY_DELETE_CONDITION.format(args['condition_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201

   
