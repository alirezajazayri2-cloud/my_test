from kivy.app import App
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.clock import Clock
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout

# --------- رابط کاربری (KV) ----------
KV = """
ScreenManager:
    TargetsScreen:

<TargetsScreen>:
    name: 'targets'

    BoxLayout:
        orientation: 'vertical'
        padding: 10
        spacing: 10

        Label:
            text: "لیست هدفجوها"
            size_hint_y: None
            height: '40dp'

        ScrollView:
            size_hint_y: 1

            BoxLayout:
                id: targets_list
                orientation: 'vertical'
                size_hint_y: None
                height: self.minimum_height

        Button:
            text: "افزودن هدفجو جدید"
            size_hint_y: None
            height: '48dp'
            on_release:
                print("دکمه 'افزودن هدفجو جدید' فشرده شد")
"""

# --------- صفحه هدفجوها ----------
class TargetsScreen(Screen):
    def on_pre_enter(self, *args):
        # مهم: دیگه اینجا مستقیماً refresh_targets_list را صدا نمی‌زنیم
        Clock.schedule_once(self._do_refresh, 0)

    def _do_refresh(self, dt):
        self.refresh_targets_list()

    def refresh_targets_list(self):
        print("refresh_targets_list called. ids =", self.ids.keys())

        if 'targets_list' not in self.ids:
            print("WARNING: 'targets_list' id not found in this screen!")
            return  # برای جلوگیری از ارور، هیچ کار دیگری نمی‌کنیم

        container = self.ids.targets_list
        container.clear_widgets()

        box = BoxLayout()
        box.add_widget(Label(text="یک هدفجو به صورت تست"))
        container.add_widget(box)

# --------- کلاس اصلی اپلیکیشن ----------
class MyApp(App):
    def build(self):
        self.title = "WAI - Minimal Test App"
        root = Builder.load_string(KV)
        return root

# --------- نقطه شروع برنامه ----------
if __name__ == '__main__':
    print(">>> Starting MyApp from main.py")
    MyApp().run()
