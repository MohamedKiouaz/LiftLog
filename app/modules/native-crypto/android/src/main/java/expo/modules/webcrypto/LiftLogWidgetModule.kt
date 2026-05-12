package expo.modules.webcrypto

import android.content.Context
import android.content.Intent
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LiftLogWidgetModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("LiftLogWidget")

        Function("updateSessionFrequency") { snapshot: SessionFrequencyWidgetSnapshot ->
            val context = appContext.reactContext ?: return@Function
            context
                .getSharedPreferences("session_frequency_widget", Context.MODE_PRIVATE)
                .edit()
                .putFloat("sessions_per_week", snapshot.sessionsPerWeek.toFloat())
                .putInt("session_count", snapshot.sessionCount)
                .apply()

            context.sendBroadcast(
                Intent("com.limajuice.liftlog.action.UPDATE_SESSION_FREQUENCY_WIDGET")
                    .setPackage(context.packageName)
            )
        }
    }
}

class SessionFrequencyWidgetSnapshot : Record {
    @Field
    val sessionsPerWeek: Double = 0.0

    @Field
    val sessionCount: Int = 0
}
