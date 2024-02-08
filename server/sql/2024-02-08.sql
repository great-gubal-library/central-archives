ALTER TABLE user
  ADD tokensValidAfter datetime(6),
  ADD totpSecret varchar(40),
  ADD backupCode varchar(16);
