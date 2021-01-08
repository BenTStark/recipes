DROP SCHEMA IF EXISTS recipes CASCADE;

CREATE SCHEMA recipes;
ALTER DATABASE dev SET search_path TO root,example,recipes,public;