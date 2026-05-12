package com.limajuice.liftlog

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.util.Locale

class SessionFrequencyWidgetProvider : AppWidgetProvider() {
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == refreshAction) {
            updateAll(context)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        appWidgetIds.forEach { appWidgetId ->
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private const val refreshAction = "com.limajuice.liftlog.action.UPDATE_SESSION_FREQUENCY_WIDGET"
        private const val preferencesName = "session_frequency_widget"
        private const val sessionsPerWeekKey = "sessions_per_week"
        private const val sessionCountKey = "session_count"

        fun saveSnapshot(
            context: Context,
            sessionsPerWeek: Double,
            sessionCount: Int,
        ) {
            context
                .getSharedPreferences(preferencesName, Context.MODE_PRIVATE)
                .edit()
                .putFloat(sessionsPerWeekKey, sessionsPerWeek.toFloat())
                .putInt(sessionCountKey, sessionCount)
                .apply()
        }

        fun updateAll(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, SessionFrequencyWidgetProvider::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            appWidgetIds.forEach { appWidgetId ->
                updateWidget(context, appWidgetManager, appWidgetId)
            }
        }

        private fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val preferences = context.getSharedPreferences(preferencesName, Context.MODE_PRIVATE)
            val sessionsPerWeek = preferences.getFloat(sessionsPerWeekKey, 0f)
            val sessionCount = preferences.getInt(sessionCountKey, 0)
            val views = RemoteViews(context.packageName, R.layout.session_frequency_widget).apply {
                setTextViewText(
                    R.id.session_frequency_value,
                    String.format(Locale.US, "%.1f", sessionsPerWeek),
                )
                setTextViewText(
                    R.id.session_frequency_total,
                    context.resources.getQuantityString(
                        R.plurals.session_frequency_widget_total,
                        sessionCount,
                        sessionCount,
                    ),
                )
                setOnClickPendingIntent(R.id.session_frequency_widget_root, launchIntent(context))
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun launchIntent(context: Context): PendingIntent {
            val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: Intent(context, MainActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)

            return PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }
    }
}
