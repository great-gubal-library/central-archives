ALTER TABLE server ADD region ENUM('eu', 'na', 'jp', 'oc');
UPDATE server SET region = 'eu' WHERE datacenter IN ('Chaos', 'Light');
ALTER TABLE server MODIFY region ENUM('eu', 'na', 'jp', 'oc') NOT NULL;

ALTER TABLE event ADD region ENUM('eu', 'na', 'jp', 'oc');
UPDATE event SET region = 'eu';
ALTER TABLE event MODIFY region ENUM('eu', 'na', 'jp', 'oc') NOT NULL;
