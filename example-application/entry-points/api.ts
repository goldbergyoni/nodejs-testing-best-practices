import bodyParser from 'body-parser';
import express from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import util from 'util';
import orderService from '../business-logic/order-service';
import { errorHandler } from '../error-handling';

let connection: Server | null = null;

export const startWebServer = (): Promise<AddressInfo> => {
  return new Promise<AddressInfo>((resolve, reject) => {
    const expressApp = express();
    expressApp.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    expressApp.use(bodyParser.json());
    defineRoutes(expressApp);
    // ️️️✅ Best Practice 8.13: Specify no port for testing, only in production
    // 📖 Read more at: bestpracticesnodejs.com/bp/8.13
    const webServerPort = process.env.PORT ? process.env.PORT : null;
    connection = expressApp.listen(webServerPort, () => {
      resolve(connection!.address() as AddressInfo);
    });
  });
};

export const stopWebServer = async () => {
  return new Promise<void>((resolve, reject) => {
    if (connection) {
      connection.close(() => {
        return resolve();
      });
    }
    return resolve();
  });
};

const defineRoutes = (expressApp: express.Application) => {
  const router = express.Router();

  // add new order
  router.post('/', async (req, res, next) => {
    try {
      console.log(
        `Order API was called to add new Order ${util.inspect(req.body)}`
      );
      const addOrderResponse = await orderService.addOrder(req.body);
      return res.json(addOrderResponse);
    } catch (error) {
      next(error);
    }
  });

  // get existing order by id
  router.get('/:id', async (req, res, next) => {
    console.log(`Order API was called to get order by id ${req.params.id}`);
    const response = await orderService.getOrder(req.params.id);

    if (!response) {
      res.status(404).end();
      return;
    }

    res.json(response);
  });

  // delete order by id
  router.delete('/:id', async (req, res, next) => {
    console.log(`Order API was called to delete order ${req.params.id}`);
    await orderService.deleteOrder(req.params.id);
    res.status(204).end();
  });

  expressApp.use('/order', router);

  expressApp.use(
    async (
      error: unknown,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (error && typeof error === 'object' && 'isTrusted' in error) {
        if (error.isTrusted === undefined || error.isTrusted === null) {
          error.isTrusted = true; //Error during a specific request is usually not catastrophic and should not lead to process exit
        }
      }
      await errorHandler.handleError(error);

      res.status(error?.status || 500).end();
    }
  );
};

process.on('uncaughtException', (error) => {
  errorHandler.handleError(error);
});

process.on('unhandledRejection', (reason) => {
  errorHandler.handleError(reason);
});
