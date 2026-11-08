import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  runApp(const CarShowcaseApp());
}

class CarShowcaseApp extends StatelessWidget {
  const CarShowcaseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '3D Car Showcase',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const Scaffold(
        backgroundColor: Color(0xFF0D1117),
        body: SizedBox.expand(
          child: AndroidView(viewType: 'car-showcase/scene'),
        ),
      ),
    );
  }
}
