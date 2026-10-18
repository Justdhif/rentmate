DROP INDEX "rooms_property_room_number_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_property_room_number_unique_idx" ON "rooms" USING btree ("property_id","room_number");--> statement-breakpoint
CREATE UNIQUE INDEX "active_room_assignment_unique_idx" ON "room_assignments" USING btree ("room_id") WHERE status = 'ACTIVE';--> statement-breakpoint
CREATE UNIQUE INDEX "active_tenant_assignment_unique_idx" ON "room_assignments" USING btree ("tenant_id") WHERE status = 'ACTIVE';--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_property_user_unique_idx" ON "reviews" USING btree ("property_id","user_id");