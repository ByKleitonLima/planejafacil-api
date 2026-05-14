import { authenticateToken } from "../authenticate-jwt";

describe("Authenticate jwt", () => {

    test("given no authorization header, then return error 401", async () => {
        const request = { headers: {} };
        const response = new ResponseMock();
        const next = jest.fn();

        await authenticateToken(request, response, next, {
            verifyIdToken: () => Promise.reject()
        });

        expect(response._status).toEqual(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("given authorization header, when invalid, then return 401", async () => {
        const request = {
            headers: { authorization: "invalid" }
        };
        const response = new ResponseMock();
        const next = jest.fn();

        await authenticateToken(request, response, next);

        expect(response._status).toEqual(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("given authorization header, when valid, then add user to request", async () => {
        const request = {
            headers: { authorization: "Bearer valid_token" }
        };
        const response = new ResponseMock();
        const next = jest.fn();
        const auth = {
            verifyIdToken: () => Promise.resolve({ uid: "anyUserUid" })
        };

        await authenticateToken(request, response, next, auth);

        expect(request.user).toEqual({ uid: "anyUserUid" });
        expect(next).toHaveBeenCalled();
    });

    class ResponseMock {
        _status;

        status(value) {
            this._status = value;
            return this;
        }

        json(value) { }
    }
});