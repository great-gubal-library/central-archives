ALTER TABLE server ADD region ENUM('eu', 'na', 'jp', 'oc');
UPDATE server SET region = 'eu' WHERE datacenter IN ('Chaos', 'Light');
ALTER TABLE server MODIFY region ENUM('eu', 'na', 'jp', 'oc') NOT NULL;

ALTER TABLE event ADD region ENUM('eu', 'na', 'jp', 'oc');
UPDATE event SET region = 'eu';
ALTER TABLE event MODIFY region ENUM('eu', 'na', 'jp', 'oc') NOT NULL;

ALTER TABLE community
  DROP INDEX IDX_696fdadbf0a710efbbf9d98ad9,
  ADD region ENUM('eu', 'na', 'jp', 'oc'),
  ADD UNIQUE uq_community_name_region(name, region);

UPDATE community SET region = 'eu';
ALTER TABLE community MODIFY region ENUM('eu', 'na', 'jp', 'oc') NOT NULL;
