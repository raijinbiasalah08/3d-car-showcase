package com.raijin.carshowcase

import android.content.Context
import android.graphics.Color
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.view.View
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.StandardMessageCodec
import io.flutter.plugin.platform.PlatformView
import io.flutter.plugin.platform.PlatformViewFactory
import java.io.ByteArrayInputStream
import java.io.FileNotFoundException

private const val SCENE_VIEW_TYPE = "car-showcase/scene"
private const val ASSET_HOST = "flutter.local"
private const val FLUTTER_ASSET_ROOT = "flutter_assets/assets/web/"

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        flutterEngine.platformViewsController.registry.registerViewFactory(
            SCENE_VIEW_TYPE,
            CarShowcaseViewFactory(),
        )
    }
}

private class CarShowcaseViewFactory : PlatformViewFactory(StandardMessageCodec.INSTANCE) {
    override fun create(context: Context, viewId: Int, args: Any?): PlatformView {
        return CarShowcasePlatformView(context)
    }
}

private class CarShowcasePlatformView(context: Context) : PlatformView {
    private val webView = WebView(context)

    init {
        webView.setBackgroundColor(Color.rgb(13, 17, 23))
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            allowFileAccess = false
            allowContentAccess = false
            mediaPlaybackRequiresUserGesture = true
        }
        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest,
            ): WebResourceResponse? {
                val uri = request.url
                if (uri.scheme != "https" || uri.host != ASSET_HOST) return null

                val path = uri.path?.trimStart('/')?.ifEmpty { "index.html" } ?: "index.html"
                if (path.contains("..")) return notFound()

                return try {
                    val extension = path.substringAfterLast('.', "").lowercase()
                    val mimeType = when (extension) {
                        "html" -> "text/html"
                        "js" -> "text/javascript"
                        "css" -> "text/css"
                        "json", "webmanifest" -> "application/json"
                        "svg" -> "image/svg+xml"
                        "png" -> "image/png"
                        "jpg", "jpeg" -> "image/jpeg"
                        "woff", "woff2" -> "font/woff2"
                        else -> "application/octet-stream"
                    }
                    WebResourceResponse(
                        mimeType,
                        if (mimeType.startsWith("text/") || mimeType == "application/json") "utf-8" else null,
                        context.assets.open(FLUTTER_ASSET_ROOT + path),
                    )
                } catch (_: FileNotFoundException) {
                    notFound()
                }
            }
        }
        webView.loadUrl("https://$ASSET_HOST/index.html")
    }

    override fun getView(): View = webView

    override fun dispose() {
        webView.stopLoading()
        webView.destroy()
    }

    private fun notFound(): WebResourceResponse = WebResourceResponse(
        "text/plain",
        "utf-8",
        404,
        "Not Found",
        emptyMap(),
        ByteArrayInputStream(ByteArray(0)),
    )
}
