\set ON_ERROR_STOP on
\if :{?app_schema}
\else
  \set app_schema myapp
\endif
SELECT :'app_schema' ~ '^[a-z][a-z0-9_]{0,62}$'
  AND :'app_schema' NOT IN ('public', 'systemchart', 'information_schema')
  AND :'app_schema' NOT LIKE 'pg\_%' AS valid_app_schema \gset
\if :valid_app_schema
\else
  \echo 'Choose an app-specific lowercase schema; public, systemchart and system schemas are reserved.'
  SELECT 1 / 0; -- ON_ERROR_STOP makes an invalid setup exit nonzero.
\endif
