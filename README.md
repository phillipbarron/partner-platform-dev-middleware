# PP Login middleware

will be some express middleware which will authenicate with partner platform and set a cookie where an app is running on local dev.

This is intended for use in applications which host child activities which are logged in by the parent.

It may be necessary to add headers too - In fact, do we need a cookie? Maybe just adding the headers will be fine

We are probably going to want to cache this stuff - we could just stick it in an opject - the token is good for 24 hours and who is going to runa  dev instance for that long? Might not event need to worry about TTL tbf

