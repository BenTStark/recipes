from flask_restx import Resource, Namespace, fields
from utils import file_processor, database_processor, sql_processor
from flask_restx import reqparse, inputs
from flask import request
import pandas as pd
import json

api = Namespace('tag', description='Handling ingredient tags')

model_tag = api.model('tag', {
    'nextId': fields.Integer(required=True, description='The next identifier;'),
    'payload': fields.List(fields.Nested(api.model('tag_payload', {
        'tag_id': fields.Integer(required=True, description='tag idenifier'),
        'tag_group': fields.String(required=True, description='tag name'),
        'name': fields.String(required=True, description='tag name')
    })))
})

post_model_tag = api.model('tag_post', {
    'nextId': fields.Integer(required=True, description='The next identifier;')
})

@api.response(404, 'Entry not found')
class HandleTagList(Resource):
    @api.marshal_with(model_tag)
    def get(self):          
        QUERY_SELECT_TAG_LIST = file_processor.read_sql_file(
            "sql/tag/select_tag_list.sql")
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(QUERY_SELECT_TAG_LIST).to_dict(orient="records")
        
        # START - Get nextId
        QUERY_NEXTID_TAG = file_processor.read_sql_file(
            "sql/tag/nextid_tag.sql")
        sql_creation = QUERY_NEXTID_TAG
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)


postParser = reqparse.RequestParser()
postParser.add_argument('tag_group', required=True, type=str)
postParser.add_argument('name', required=True, type=str)

updateParser = reqparse.RequestParser()
updateParser.add_argument('tag_id', required=True, type=int,
                    help="Id cannot be blank!")
updateParser.add_argument('tag_group', required=True, type=str)
updateParser.add_argument('name', required=True, type=str)

deleteParser = reqparse.RequestParser()
deleteParser.add_argument('tag_id', required=True, type=int,
                    help="Id cannot be blank!")

getParser = reqparse.RequestParser()
getParser.add_argument('tag_id', required=True, type=int,
                    help="Id cannot be blank!")

class HandleTag(Resource):    
    @api.doc(parser=getParser)
    def get(self):   
        args = getParser.parse_args()           
        QUERY_SELECT_TAG = file_processor.read_sql_file(
            "sql/tag/select_tag.sql")
        sql_creation = QUERY_SELECT_TAG.format(args['tag_id'])
        recipeList = database_processor.fetch_data_in_database_pd_dataframe(sql_creation).to_dict(orient="records")
        # START - Get nextId
        QUERY_NEXTID_TAG = file_processor.read_sql_file(
            "sql/tag/nextid_tag.sql")
        sql_creation = QUERY_NEXTID_TAG
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        if recipeList:
            return {'payload': recipeList, 'nextId': nextId[0][0]}
        api.abort(404)
    
    @api.doc(parser=postParser)
    @api.doc(responses={
        400: 'Validation Error'
    })
    @api.marshal_with(post_model_tag, code=201, description='new tag created')
    def post(self):
        args = postParser.parse_args()    
        QUERY_POST_TAG = file_processor.read_sql_file(
            "sql/tag/post_tag.sql")
            
        sql_creation = QUERY_POST_TAG.format("\'{}\'".format(args['tag_group']),"\'{}\'".format(args['name']))
        sql_creation = sql_processor.handleNone(sql_creation)
        database_processor.insert_data_into_database(sql_creation)
         # START Get nextId
        QUERY_NEXTID_TAG= file_processor.read_sql_file(
            "sql/tag/nextid_tag.sql")
        sql_creation = QUERY_NEXTID_TAG
        nextId = database_processor.fetch_data_in_database(sql_creation)
        # END - Get nextId
        return ({'nextId': nextId[0][0]},201)

    @api.doc(parser=updateParser)
    def put(self):
        args = updateParser.parse_args()    
        QUERY_PUT_TAG = file_processor.read_sql_file(
            "sql/tag/put_tag.sql")
        sql_creation = QUERY_PUT_TAG.format("\'{}\'".format(args['tag_group']),"\'{}\'".format(args['name']),args['tag_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201
    
    @api.doc(parser=deleteParser)
    def delete(self):
        args = deleteParser.parse_args()    
        QUERY_DELETE_TAG = file_processor.read_sql_file(
            "sql/tag/delete_tag.sql")
        sql_creation = QUERY_DELETE_TAG.format(args['tag_id'])
        database_processor.insert_data_into_database(sql_creation)
        return 201

   
