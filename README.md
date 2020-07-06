# PP Login middleware

Express middleware which will authenicate with BBC Login via the Partner platform login id generator and set this as an auth token on incomming requests.

This is intended for use in applications which host child activities which are logged in by the parent.

## install

```bash
yarn add @bbc/partner-platform-dev-middleware
```

## Usage

```javascript
import ppDevAuthMiddleware from '@bbc/partner-platform-dev-auth-middleware';

const app = express();

app.use(ppDevAuthMiddleware());
```

## todo

* move the proxying part in here too
* add build
* publish


## The async call in the init of this upsets express - have done this work in the dev boot section insead
