# rpct

Api<Methods> -> Transport -> { ... session ... } -> Transport -> Api<Methods>

Api operates with messages.  
It can receive message and invoke local method.  
It can emit message and send to remote api to invoke remote method.  
It can bind callback and receive message to invoke local callback method.

Transport operates with data serialization and deserialization. It resend messages over any session to remote connected Transport.