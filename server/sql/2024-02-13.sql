ALTER TABLE server ADD region ENUM('eu', 'na', 'jp', 'oc');
UPDATE server SET region = 'eu' WHERE datacenter IN ('Chaos', 'Light');
ALTER TABLE server MODIFY region ENUM('eu', 'na', 'jp', 'oc') NOT NULL;
