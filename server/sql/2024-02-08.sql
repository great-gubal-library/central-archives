ALTER TABLE user
  ADD tokensValidAfter datetime(6),
  ADD use2FA tinyint(4) NOT NULL DEFAULT 0,
  ADD totpSecret varchar(40),
  ADD backupCode varchar(16);
