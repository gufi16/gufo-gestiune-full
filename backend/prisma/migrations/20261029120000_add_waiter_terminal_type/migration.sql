-- Allow Gufo Ospatar terminals to use the same cloud pairing flow as KDS.
ALTER TYPE "TerminalDeviceType" ADD VALUE IF NOT EXISTS 'WAITER';
