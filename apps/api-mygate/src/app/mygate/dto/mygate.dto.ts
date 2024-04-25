export class MyGateNotifyDto {
  device_id: string;
  access_uuid_type: string;
  access_entity_type: string;
  access_ref_id: string;
  access_uuid_captured: string;
  direction: string;
  status: string;
  timestamp: string;
}

export class MyGateNotifyResponseDto {
  es: string;
  message: string;
}

export class MyGateSyncCard {
  access_entity_type: string;
  access_uuid_type: string;
  access_ref_id: string;
  access_uuid: string;
  access_display: string;
}

export class MyGateSyncResponseDto {
  timestamp: number;
  all?: MyGateSyncCard[];
  deleted?: string[];
  upserted?: MyGateSyncCard[];
  success: boolean;
  _links?: {
    next: {
      href: string;
    };
  };
}
