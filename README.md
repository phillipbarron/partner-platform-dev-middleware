# PP Login middleware

Express middleware which will authenicate with BBC Login via the Partner platform login id generator and set this as an auth token on incomming requests.

This is intended for use in applications which host child activities which are logged in by the parent.

## Usage

```javascript
import ppDevAuthMiddleware from '@bbc/partner-platform-dev-auth-middleware';

const app = express();

app.use(ppDevAuthMiddleware());
```
