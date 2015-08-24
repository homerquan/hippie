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

## Author
  * Homer Quan (homerquan@gmail.com)

## License
The MIT license.

Copyright (c) 2013-2015 Homer Quan (http://www.homerquan.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
