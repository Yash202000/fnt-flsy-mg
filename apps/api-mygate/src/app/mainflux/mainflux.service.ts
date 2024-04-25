import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import {
  MQTT_DOMAIN_MYGATE,
  MQTT_HTTP_PROTOCOL_MYGATE,
  MQTT_MAX_RETRY_COUNT,
  MQTT_PASSWORD,
  MQTT_PORT_MYGATE,
  MQTT_USERNAME,
} from '../core/consts/env.consts';
import * as mqtt from 'mqtt';
import { AccessNotifyDto } from '../core/dto/access-notify.dto';

@Injectable()
export class MainFluxService {
  private USER_TOKEN = '';

  async connectAndPublishWithRetry<T>(
    payload: T,
    thingId: string,
    thingKey: string,
    channelId: string,
    topicName: string
  ) {
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
    console.log(thingKey, thingId, channelId, payload, clientId);
    const mqttOptions = {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: thingId,
      password: thingKey,
      reconnectPeriod: 1000,
      // additional options can be added here
    };
    const maxRetryAttempts = MQTT_MAX_RETRY_COUNT;
    let retryCount = 0;
    while (retryCount < maxRetryAttempts) {
      try {
        // Connect to the MQTT broker
        const client = mqtt.connect(
          `mqtt://${MQTT_DOMAIN_MYGATE}:${MQTT_PORT_MYGATE}`,
          mqttOptions
        );
        // wrap the connection in a promise to handle connection errors
        await new Promise((resolve, reject) => {
          client.on('connect', () => {
            console.log('Connected to MQTT broker');
            resolve(true); // Resolve with a boolean to indicate the success
          });
          client.on('error', (error) => {
            console.error(`MQTT connection error: ${error}`);
            client.end(); // Close the connection if an error occurs
            reject(false); // Reject with a boolean to indicate the failure reason
          });
          client.on('close', () => {
            console.log(`MQTT connection close`); // resolve(true);
            client.end(); // Close the connection if an error occurs
            reject(false);
          });
          client.on('end', () => {
            console.log(`MQTT connection end`); // resolve(true);
          });
        });
        // publish your message here
        const topic = `channels/${channelId}/messages/${topicName}`;
        const message = JSON.stringify(payload);
        client.publish(topic, message, (err) => {
          if (err) {
            console.error(`Error while publishing: ${err.message}`);
            return false;
          }
          // close the connection after publishing
          console.log('Published to MQTT', topic, payload);
          client.end();
        });
        // exit the function after successful publish
        return true;
      } catch (error) {
        // Retry the connection after a delay
        retryCount++;
        console.log(`Retry attempt ${retryCount} failed: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the delay as needed // return { //status: false, //resp: error.message // }
      }
    }
    console.error('Failed to connect after multiple attempts.'); // return 'Failed to connect after multiple attempts.'
    return false;
  }

  async updateUserToken() {
    const userTokenResponse = await axios.post(
      `${MQTT_HTTP_PROTOCOL_MYGATE}://${MQTT_DOMAIN_MYGATE}/tokens`,
      {
        email: `${MQTT_USERNAME}`,
        password: `${MQTT_PASSWORD}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (userTokenResponse) {
      this.USER_TOKEN = userTokenResponse.data.token;
    }
  }

  async deleteThing(thingId: string) {
    return await this.deleteThingRequest(thingId).catch(
      async (e: AxiosError) => {
        // retry once with new user token
        await this.updateUserToken();
        return await this.deleteThingRequest(thingId);
      }
    );
  }

  deleteThingRequest(thingId: string) {
    return axios.delete(
      `${MQTT_HTTP_PROTOCOL_MYGATE}://${MQTT_DOMAIN_MYGATE}/things/${thingId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.USER_TOKEN}`,
        },
      }
    );
  }

  async deleteChannel(channelId: string) {
    return await this.deleteChannelRequest(channelId).catch(
      async (e: AxiosError) => {
        // retry once with new user token
        await this.updateUserToken();
        return await this.deleteChannelRequest(channelId);
      }
    );
  }

  deleteChannelRequest(channelId: string) {
    return axios.delete(
      `${MQTT_HTTP_PROTOCOL_MYGATE}://${MQTT_DOMAIN_MYGATE}/channels/${channelId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.USER_TOKEN}`,
        },
      }
    );
  }

  async createThing(deviceId: string) {
    return await this.createThingRequest(deviceId).catch(
      async (e: AxiosError) => {
        // retry once with new user token
        await this.updateUserToken();
        return await this.createThingRequest(deviceId);
      }
    );
  }

  private createThingRequest(deviceId: string) {
    const data = [{ name: deviceId }];
    return axios.post(
      `${MQTT_HTTP_PROTOCOL_MYGATE}://${MQTT_DOMAIN_MYGATE}/things`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.USER_TOKEN}`,
        },
      }
    );
  }

  async createChannel(deviceId: string) {
    return await this.createChannelRequest(deviceId).catch(
      async (e: AxiosError) => {
        // retry once with new user token
        await this.updateUserToken();
        return await this.createChannelRequest(deviceId);
      }
    );
  }

  private createChannelRequest(deviceId: string) {
    const data = [{ name: deviceId }];
    return axios.post(
      `${MQTT_HTTP_PROTOCOL_MYGATE}://${MQTT_DOMAIN_MYGATE}/channels`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.USER_TOKEN}`,
        },
      }
    );
  }

  async connectThingChannel(thingId: string, channelId: string) {
    return await this.connectThingChannelRequest(thingId, channelId).catch(
      async (e: AxiosError) => {
        // retry once with new user token
        await this.updateUserToken();
        return await this.connectThingChannelRequest(thingId, channelId);
      }
    );
  }

  private connectThingChannelRequest(thingId: string, channelId: string) {
    return axios.put(
      `${MQTT_HTTP_PROTOCOL_MYGATE}://${MQTT_DOMAIN_MYGATE}/channels/${channelId}/things/${thingId}`,
      null,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.USER_TOKEN}`,
        },
      }
    );
  }

  async publishNotifyToMqtt(
    accessNotifyDto: AccessNotifyDto,
    deviceId: string,
    thingId: string,
    thingKey: string,
    channelId: string
  ) {
    // build senml for notification
    const body = [
      {
        bn: '',
        bt: accessNotifyDto.ts,
        bu: '',
        bver: 5,
        n: 'deviceId',
        vs: deviceId,
      },
      {
        n: 'cardId',
        vs: accessNotifyDto.ci,
      },
      {
        n: 'status',
        vs: accessNotifyDto.st,
      },
      {
        n: 'direction',
        vs: accessNotifyDto.dr,
      },
    ];
    return this.connectAndPublishWithRetry(
      body,
      thingId,
      thingKey,
      channelId,
      'mygate-notify'
    );
  }
}
