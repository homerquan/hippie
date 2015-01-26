![alt tag](http://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Peace_sign.svg/330px-Peace_sign.svg.png)
hippie version 2.0
======


A hypermedia api framework

##Changes
 * Add basic register, login API
 * Add email verification, find lost password API
 * Provide email templates

##In progress
 * Hypermedia id defrefence plugin for mongoose (will be a seperate project)

##Goal
  * Create an hypermedia API platform to easy consume linked data. A good example is this question from stockoverflow: http://stackoverflow.com/questions/11650426/working-with-a-hypermedia-rest-api-in-backbone/11652795#11652795

##Features
  * Generic domain style
    * Item
    * Collection
    * Paged collection
  * Linkes factor: dereferenceable uri
  * Context(schema) to UI render template
  * Generate route automatically
  * Hypermedia id e.g., user: "/user/123" can dereference by "?extent=user"
  * OAuth2 (Password, Authorization code flow), support client specifed scope. Provided by <https://github.com/homerquan/hippie-authorization>

##License
  MIT
##Copyright
  Homer Quan
  support@homerquan.com"
  www.homerquan.com
