import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI

async function fixScheduleData() {
  console.log("🔧 Starting schedule data repair...")

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db("fitbalance")
    const collection = db.collection("NutritionistSchedules")

    // 1. Find all schedules
    const allSchedules = await collection.find({}).toArray()
    console.log(`📊 Found ${allSchedules.length} schedule records`)

    // 2. Group by nutritionist_id (normalize string vs ObjectId)
    const schedulesByNutritionist = {}

    for (const schedule of allSchedules) {
      const nutritionistId = schedule.nutritionist_id.toString()

      if (!schedulesByNutritionist[nutritionistId]) {
        schedulesByNutritionist[nutritionistId] = []
      }
      schedulesByNutritionist[nutritionistId].push(schedule)
    }

    console.log(`👥 Found schedules for ${Object.keys(schedulesByNutritionist).length} nutritionists`)

    // 3. Fix duplicates and normalize nutritionist_id format
    for (const [nutritionistId, schedules] of Object.entries(schedulesByNutritionist)) {
      console.log(`\n🔍 Processing nutritionist: ${nutritionistId}`)
      console.log(`   Found ${schedules.length} schedule(s)`)

      if (schedules.length > 1) {
        // Keep the most recent one
        const mostRecent = schedules.reduce((latest, current) => {
          return new Date(current.updated_at || current.created_at) > new Date(latest.updated_at || latest.created_at)
            ? current
            : latest
        })

        console.log(`   ⚠️  Multiple schedules found, keeping most recent: ${mostRecent._id}`)

        // Delete the older ones
        const toDelete = schedules.filter((s) => s._id.toString() !== mostRecent._id.toString())
        for (const schedule of toDelete) {
          await collection.deleteOne({ _id: schedule._id })
          console.log(`   🗑️  Deleted duplicate: ${schedule._id}`)
        }

        // Update the remaining one to ensure consistent format
        await collection.updateOne(
          { _id: mostRecent._id },
          {
            $set: {
              nutritionist_id: nutritionistId, // Store as string for consistency
              updated_at: new Date().toISOString(),
            },
          },
        )
        console.log(`   ✅ Updated remaining schedule with consistent format`)
      } else {
        // Single schedule, just normalize the format
        const schedule = schedules[0]
        await collection.updateOne(
          { _id: schedule._id },
          {
            $set: {
              nutritionist_id: nutritionistId, // Store as string for consistency
              updated_at: new Date().toISOString(),
            },
          },
        )
        console.log(`   ✅ Normalized single schedule format`)
      }
    }

    // 4. Verify the final state
    const finalSchedules = await collection.find({}).toArray()
    console.log(`\n🎉 Repair completed!`)
    console.log(`📊 Final count: ${finalSchedules.length} schedule records`)

    // Display final schedules for verification
    for (const schedule of finalSchedules) {
      console.log(`   📅 Schedule ID: ${schedule._id}`)
      console.log(`      Nutritionist: ${schedule.nutritionist_id}`)
      console.log(`      Working Days: ${schedule.working_days?.length || 0} days`)
      console.log(`      Working Hours: ${schedule.working_hours?.start} - ${schedule.working_hours?.end}`)
      console.log("")
    }
  } catch (error) {
    console.error("❌ Error fixing schedule data:", error)
  } finally {
    await client.close()
    console.log("🔌 Database connection closed")
  }
}

// Run the fix
fixScheduleData()