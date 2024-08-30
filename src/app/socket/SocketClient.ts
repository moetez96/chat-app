import { Client, IMessage } from "@stomp/stompjs";

interface PublishOptions {
  destination: string;
  body: any;
}

interface AwaitConnectConfig {
  retries?: number;
  curr?: number;
  timeinterval?: number;
}

export class SocketClient {
  private url: string;
  private _jwt: string;
  private client: Client;

  constructor(url: string, jwt: string) {
    this.url = url;
    this._jwt = jwt;
    this.client = new Client();

    this.client.configure({
      brokerURL: url,
      connectHeaders: {
        Authorization: `Bearer ${jwt}`,
      },
      onConnect: () => {
        console.log("connected!");
      },
    });

    this.client.activate();
  }

  publish = ({ destination, body }: PublishOptions): void => {
    this.client.publish({
      destination: destination,
      body: JSON.stringify(body),
    });
  };

  deactivate = (): void => {
    this.client.deactivate();
  };

  subscribe = (
    topic: string,
    callback: (message: IMessage) => void,
    ...forMessageTypes: string[]
  ) => {
    return this.client.subscribe(topic, (message) => {
      if (
        !forMessageTypes.length ||
        forMessageTypes.includes(JSON.parse(message.body).messageType)
      ) {
        callback(message);
      }
    });
  };

  awaitConnect = async (awaitConnectConfig?: AwaitConnectConfig): Promise<void> => {
    const {
      retries = 3,
      curr = 0,
      timeinterval = 100,
    } = awaitConnectConfig || {};
    return new Promise((resolve, reject) => {
      console.log(timeinterval);
      setTimeout(() => {
        if (this.connected) {
          resolve();
        } else {
          console.log("failed to connect! retrying");
          if (curr >= retries) {
            console.log("failed to connect within the specified time interval");
            reject();
          } else {
            this.awaitConnect({ ...awaitConnectConfig, curr: curr + 1 }).then(resolve).catch(reject);
          }
        }
      }, timeinterval);
    });
  };

  get connected(): boolean {
    return this.client.connected;
  }

  get jwt(): string {
    return this._jwt;
  }

  set jwt(value: string) {
    this._jwt = value;
  }
}
