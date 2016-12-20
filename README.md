# Workfront WDC
A Tableau Web Data Connector for Workfront

Running version of the Workfront Tableau Web Data Connector is also available here:
[https://workfront-web-data-connector.herokuapp.com/](https://workfront-web-data-connector.herokuapp.com/)

## Usage
The WDC currently support 3 Workfront objects (i.e. project, issue and task) 
linked to a given project (i.e. project id).

For a detailed list of which fields get pulled by default, please consult the 
extensive [Workfront API documentation](https://developers.workfront.com/api-docs/api-explorer).

Any fields not listed in the documentation are user created and will need to be
manually added in the textarea. To find the unique name of a given custom field, 
navigate to any form in Workfront that contains the field in question and use 
developer tools to retrieve the 'name' attribute from the HTML element. Next, 
separate the name of the field and the type (i.e. string, int, float, boolean)
with a pipe character (|).

```
DE:Custom Description|string
DE:Added Value|int
DE:Is Custom Field|boolean
DE:Amount|float
```

## Local set-up
- NPM dependencies
  - `npm install`

## Local usage
- Run `grunt` from the command line.
- Open Tableau, navigate to Web Data Connector
- Browse to http://localhost:9001
- Fill in the required information and click 'Connect'
